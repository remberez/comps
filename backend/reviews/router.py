from typing import List, Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Review, Product, User
from auth.security import get_current_active_user
from .schemas import ReviewCreate, ReviewUpdate, Review as ReviewSchema

router = APIRouter(prefix="/reviews", tags=["reviews"])

@router.get("/product/{product_id}", response_model=List[ReviewSchema])
async def get_product_reviews(
    product_id: int,
    db: AsyncSession = Depends(get_db)
) -> List[Review]:
    """Получить все отзывы для продукта"""
    stmt = select(Review).where(Review.product_id == product_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/", response_model=ReviewSchema)
async def create_review(
    review_data: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_active_user)] = None
) -> Review:
    """Создать новый отзыв"""
    # Проверяем существование продукта
    stmt = select(Product).where(Product.id == review_data.product_id)
    result = await db.execute(stmt)
    if not result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Product not found"
        )
    
    # Проверяем, не оставлял ли пользователь уже отзыв на этот продукт
    stmt = select(Review).where(
        Review.user_id == current_user.id,
        Review.product_id == review_data.product_id
    )
    result = await db.execute(stmt)
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this product"
        )
    
    review = Review(
        user_id=current_user.id,
        product_id=review_data.product_id,
        rating=review_data.rating,
        comment=review_data.comment
    )
    db.add(review)
    await db.commit()
    await db.refresh(review)
    return review

@router.put("/{review_id}", response_model=ReviewSchema)
async def update_review(
    review_id: int,
    review_data: ReviewUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_active_user)] = None
) -> Review:
    """Обновить отзыв"""
    stmt = select(Review).where(
        Review.id == review_id,
        Review.user_id == current_user.id
    )
    result = await db.execute(stmt)
    review = result.scalar_one_or_none()
    
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Обновляем только указанные поля
    update_data = review_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(review, key, value)
    
    await db.commit()
    await db.refresh(review)
    return review

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: Annotated[User, Depends(get_current_active_user)] = None
) -> None:
    """Удалить отзыв"""
    stmt = select(Review).where(
        Review.id == review_id,
        Review.user_id == current_user.id
    )
    result = await db.execute(stmt)
    review = result.scalar_one_or_none()
    
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    await db.delete(review)
    await db.commit() 