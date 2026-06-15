from typing import TYPE_CHECKING

from datetime import datetime
from decimal import Decimal

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Numeric, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

if TYPE_CHECKING:
    from db import Customer, Order



class OrderGroup(Base):
    __tablename__ = "order_groupe"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id"),
        nullable=False,
    )
    ordered: Mapped[datetime] = mapped_column(
        DateTime(),
        nullable=False,
        default=datetime.now,
    )
    due_date: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)
    sended: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)
    arrived: Mapped[datetime | None] = mapped_column(DateTime(), nullable=True)
    price: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)

    __table_args__ = (
        CheckConstraint("due_date > ordered", name="chk_due_date_after_ordered"),
        CheckConstraint("arrived > sended", name="chk_arrived_after_sended"),
        CheckConstraint("price >= 0", name="chk_positive_price"),
    )

    customer: Mapped["Customer"] = relationship("Customer", back_populates="order_groups")
    orders: Mapped[list["Order"]] = relationship(
        "Order",
        back_populates="order_group",
        cascade="all, delete-orphan",
    )
