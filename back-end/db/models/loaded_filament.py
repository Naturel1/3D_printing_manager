from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

if TYPE_CHECKING:
    from db import Filament, Hardware



class LoadedFilament(Base):
    __tablename__ = "loaded_filaments"

    hardware_id: Mapped[int] = mapped_column(
        ForeignKey("hardwares.id"),
        primary_key=True,
    )
    filament_id: Mapped[int] = mapped_column(
        ForeignKey("filaments.id"),
        primary_key=True,
    )
    number_of_spool: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    __table_args__ = (
        CheckConstraint("number_of_spool > 0", name="chk_positive_number_of_spool"),
    )

    hardware: Mapped["Hardware"] = relationship(
        "Hardware",
        back_populates="loaded_filaments",
    )
    filament: Mapped["Filament"] = relationship(
        "Filament",
        back_populates="loaded_filaments",
    )
