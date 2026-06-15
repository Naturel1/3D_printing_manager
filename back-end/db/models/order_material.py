from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

if TYPE_CHECKING:
    from db import Filament, Order



class OrderMaterial(Base):
    __tablename__ = "order_material"

    order_id: Mapped[int] = mapped_column(
        ForeignKey("orders.id"),
        primary_key=True,
    )
    filament_id: Mapped[int] = mapped_column(
        ForeignKey("filaments.id"),
        primary_key=True,
    )

    order: Mapped["Order"] = relationship("Order", back_populates="order_materials")
    filament: Mapped["Filament"] = relationship(
        "Filament",
        back_populates="order_materials",
    )
