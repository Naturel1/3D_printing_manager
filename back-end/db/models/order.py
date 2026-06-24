from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

if TYPE_CHECKING:
    from db import OrderGroup, OrderMaterial, ThreeDFile


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="pending")
    order_group_id: Mapped[int] = mapped_column(
        "order_groupe_id",
        ForeignKey("order_groupe.id"),
        nullable=False,
    )
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    three_d_file_id: Mapped[int | None] = mapped_column(
        "3D_file_id",
        ForeignKey("3D_files.id"),
        nullable=True,
    )
    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_positive_quantity"),
        CheckConstraint(
            "status in ('pending', 'in_progress', 'done')",
            name="chk_order_status",
        ),
    )

    order_group: Mapped["OrderGroup"] = relationship("OrderGroup", back_populates="orders")
    three_d_file: Mapped["ThreeDFile | None"] = relationship(
        "ThreeDFile",
        back_populates="orders",
    )
    order_materials: Mapped[list["OrderMaterial"]] = relationship(
        "OrderMaterial",
        back_populates="order",
        cascade="all, delete-orphan",
    )
