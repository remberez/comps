from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from database import get_db
from models import CartItem, Product, User
from auth.security import get_current_active_user
from .schemas import CartItemCreate, CartItemUpdate, CartItem as CartItemSchema

router = APIRouter(prefix="/cart", tags=["cart"])

@router.get("/", response_model=List[CartItemSchema])
async def get_cart_items(
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_active_user)] = None
) -> List[CartItem]:
    """Получить содержимое корзины пользователя"""
    stmt = select(CartItem).where(CartItem.user_id == current_user.id).options(selectinload(CartItem.product))
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/", response_model=CartItemSchema)
async def add_to_cart(
    cart_item_data: CartItemCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_active_user)] = None
) -> CartItem:
    """Добавить товар в корзину"""
    # Проверяем существование продукта
    stmt = select(Product).where(Product.id == cart_item_data.product_id)
    result = await db.execute(stmt)
    product = result.scalar_one_or_none()
    
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product not found"
        )
    
    # Проверяем наличие достаточного количества на складе
    if product.stock < cart_item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough stock for product {product.name}"
        )
    
    # Проверяем, есть ли уже такой товар в корзине
    stmt = select(CartItem).where(
        CartItem.user_id == current_user.id,
        CartItem.product_id == cart_item_data.product_id
    ).options(selectinload(CartItem.product))
    result = await db.execute(stmt)
    existing_item = result.scalar_one_or_none()
    
    if existing_item:
        # Обновляем количество
        existing_item.quantity += cart_item_data.quantity
        await db.commit()
        await db.refresh(existing_item)
        return existing_item
    
    # Создаем новый элемент корзины
    cart_item = CartItem(
        user_id=current_user.id,
        product_id=cart_item_data.product_id,
        quantity=cart_item_data.quantity
    )
    db.add(cart_item)
    await db.commit()
    await db.refresh(cart_item)
    
    # Загружаем связанный продукт
    await db.refresh(cart_item, ['product'])
    return cart_item

@router.put("/{cart_item_id}", response_model=CartItemSchema)
async def update_cart_item(
    cart_item_id: int,
    cart_item_data: CartItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_active_user)] = None
) -> CartItem:
    """Обновить количество товара в корзине"""
    stmt = select(CartItem).where(
        CartItem.id == cart_item_id,
        CartItem.user_id == current_user.id
    ).options(selectinload(CartItem.product))
    result = await db.execute(stmt)
    cart_item = result.scalar_one_or_none()
    
    if cart_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    # Проверяем наличие достаточного количества на складе
    stmt = select(Product).where(Product.id == cart_item.product_id)
    result = await db.execute(stmt)
    product = result.scalar_one()
    
    if product.stock < cart_item_data.quantity:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Not enough stock for product {product.name}"
        )
    
    # Обновляем количество
    cart_item.quantity = cart_item_data.quantity
    await db.commit()
    await db.refresh(cart_item)
    await db.refresh(cart_item, ['product'])
    return cart_item

@router.delete("/{cart_item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    cart_item_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_active_user)] = None
) -> None:
    """Удалить товар из корзины"""
    stmt = select(CartItem).where(
        CartItem.id == cart_item_id,
        CartItem.user_id == current_user.id
    )
    result = await db.execute(stmt)
    cart_item = result.scalar_one_or_none()
    
    if cart_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cart item not found"
        )
    
    await db.delete(cart_item)
    await db.commit() 