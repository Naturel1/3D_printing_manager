from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

if TYPE_CHECKING:
    from db import LoadedFilament, ThreeDFile



class Hardware(Base):
    __tablename__ = "hardwares"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    brand: Mapped[str] = mapped_column(String(50), nullable=False)
    model: Mapped[str] = mapped_column(String(50), nullable=False)
    build_volume_x: Mapped[int] = mapped_column(Integer, nullable=False)
    build_volume_y: Mapped[int] = mapped_column(Integer, nullable=False)
    build_volume_z: Mapped[int] = mapped_column(Integer, nullable=False)
    number_toolheads: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )
    multicolor_capacity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )
    printing_model_id: Mapped[int | None] = mapped_column(
        ForeignKey("3D_files.id"),
        unique=True,
        nullable=True,
    )

    __table_args__ = (
        CheckConstraint("build_volume_x > 0", name="chk_positive_build_volume_x"),
        CheckConstraint("build_volume_y > 0", name="chk_positive_build_volume_y"),
        CheckConstraint("build_volume_z > 0", name="chk_positive_build_volume_z"),
        CheckConstraint("number_toolheads > 0", name="chk_positive_number_toolheads"),
        CheckConstraint(
            "multicolor_capacity > 0",
            name="chk_positive_multicolor_capacity",
        ),
    )

    printing_model: Mapped["ThreeDFile | None"] = relationship(
        "ThreeDFile",
        back_populates="hardware",
    )
    loaded_filaments: Mapped[list["LoadedFilament"]] = relationship(
        "LoadedFilament",
        back_populates="hardware",
        cascade="all, delete-orphan",
    )
