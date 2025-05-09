from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, insert
from datetime import datetime

from database import get_db
from models import Order, Product, User, CartItem, order_product
from auth.security import get_current_active_user
from .schemas import (
    OrderCreate,
    OrderUpdate,
    Order as OrderSchema,
    OrderWithProducts
)

router = APIRouter(prefix="/orders", tags=["orders"])

@router.get("/", response_model=List[OrderSchema])
async def get_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> List[Order]:
    """Получить список заказов пользователя"""
    stmt = select(Order).where(Order.user_id == current_user.id)
    result = await db.execute(stmt)
    orders = result.scalars().all()
    
    # Убедимся, что у всех заказов есть значения created_at и updated_at
    for order in orders:
        if order.created_at is None:
            order.created_at = datetime.utcnow()
        if order.updated_at is None:
            order.updated_at = datetime.utcnow()
    
    return orders

@router.get("/{order_id}", response_model=OrderWithProducts)
async def get_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Order:
    """Получить информацию о конкретном заказе"""
    stmt = select(Order).where(
        and_(
            Order.id == order_id,
            Order.user_id == current_user.id
        )
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Убедимся, что у заказа есть значения created_at и updated_at
    if order.created_at is None:
        order.created_at = datetime.utcnow()
    if order.updated_at is None:
        order.updated_at = datetime.utcnow()
    
    return order

@router.post("/", response_model=OrderSchema)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Order:
    """Создать новый заказ"""
    # Получаем все товары из корзины пользователя
    stmt = select(CartItem).where(CartItem.user_id == current_user.id)
    result = await db.execute(stmt)
    cart_items = result.scalars().all()
    
    if not cart_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cart is empty"
        )
    
    # Проверяем наличие всех товаров и считаем общую сумму
    total_amount = 0
    products_to_update = []
    
    for cart_item in cart_items:
        stmt = select(Product).where(Product.id == cart_item.product_id)
        result = await db.execute(stmt)
        product = result.scalar_one_or_none()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Product {cart_item.product_id} not found"
            )
        
        if product.stock < cart_item.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough stock for product {product.name}"
            )
        
        total_amount += product.price * cart_item.quantity
        products_to_update.append((product, cart_item.quantity))
    
    # Создаем заказ
    now = datetime.utcnow()
    order = Order(
        user_id=current_user.id,
        status="pending",
        total_amount=total_amount,
        shipping_address=order_data.shipping_address,
        created_at=now,
        updated_at=now
    )
    db.add(order)
    await db.flush()
    
    # Добавляем товары в заказ и обновляем количество на складе
    for product, quantity in products_to_update:
        # Добавляем связь в таблицу order_product
        stmt = insert(order_product).values(
            order_id=order.id,
            product_id=product.id,
            quantity=quantity,
            price_at_time=product.price
        )
        await db.execute(stmt)
        
        # Обновляем количество на складе
        product.stock -= quantity
    
    # Очищаем корзину
    for cart_item in cart_items:
        await db.delete(cart_item)
    
    await db.commit()
    await db.refresh(order)
    return order

@router.put("/{order_id}", response_model=OrderSchema)
async def update_order(
    order_id: int,
    order_data: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Order:
    """Обновить статус заказа"""
    stmt = select(Order).where(
        and_(
            Order.id == order_id,
            Order.user_id == current_user.id
        )
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Обновляем только статус
    if order_data.status is not None:
        order.status = order_data.status
        order.updated_at = datetime.utcnow()
    
    await db.commit()
    await db.refresh(order)
    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> None:
    """Отменить заказ"""
    stmt = select(Order).where(
        and_(
            Order.id == order_id,
            Order.user_id == current_user.id
        )
    )
    result = await db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found"
        )
    
    # Возвращаем товары на склад
    for product in order.products:
        # Получаем количество товара из таблицы order_product
        stmt = select(order_product).where(
            and_(
                order_product.c.order_id == order.id,
                order_product.c.product_id == product.id
            )
        )
        result = await db.execute(stmt)
        order_product_data = result.first()
        if order_product_data:
            product.stock += order_product_data.quantity
    
    await db.delete(order)
    await db.commit() 