from typing import TYPE_CHECKING

from decimal import Decimal

from sqlalchemy import Boolean, CheckConstraint, Integer, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

if TYPE_CHECKING:
    from db import LoadedFilament, OrderMaterial



class Filament(Base):
    __tablename__ = "filaments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brand: Mapped[str | None] = mapped_column(String(50), nullable=False)
    type: Mapped[str | None] = mapped_column(String(50), nullable=False)
    color: Mapped[str | None] = mapped_column(String(50), nullable=False)
    hex_code_color: Mapped[str | None] = mapped_column(String(6), nullable=True)
    nozzle_temperature: Mapped[int | None] = mapped_column(Integer, nullable=True)
    bed_temperature: Mapped[int | None] = mapped_column(Integer, nullable=True)
    chamber_temperature: Mapped[int | None] = mapped_column(Integer, nullable=True)
    total_weight: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    spool_weight: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    density: Mapped[Decimal | None] = mapped_column(Numeric(10, 2), nullable=True)
    abrasive: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    stock_quantity: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),
        nullable=False,
        default=0,
    )

    __table_args__ = (
        CheckConstraint("bed_temperature > 0", name="chk_positive_bed_temperature"),
        CheckConstraint(
            "chamber_temperature > 0",
            name="chk_positive_chamber_temperature",
        ),
        CheckConstraint("total_weight > 0", name="chk_positive_total_weight"),
        CheckConstraint("spool_weight > 0", name="chk_positive_spool_weight"),
        CheckConstraint("density > 0", name="chk_positive_density"),
        CheckConstraint("stock_quantity > 0", name="chk_positive_stock_quantity"),
    )

    loaded_filaments: Mapped[list["LoadedFilament"]] = relationship(
        "LoadedFilament",
        back_populates="filament",
        cascade="all, delete-orphan",
    )
    order_materials: Mapped[list["OrderMaterial"]] = relationship(
        "OrderMaterial",
        back_populates="filament",
        cascade="all, delete-orphan",
    )
