from typing import TYPE_CHECKING

from sqlalchemy import CheckConstraint, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db.database import Base

if TYPE_CHECKING:
    from db import Hardware, Order



class ThreeDFile(Base):
    __tablename__ = "3D_files"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    file_path: Mapped[str | None] = mapped_column(
        "3D_file_path",
        String(100),
        nullable=True,
    )
    category: Mapped[str | None] = mapped_column(String(50), nullable=True)
    time_printed: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
    )

    __table_args__ = (
        CheckConstraint("time_printed >= 0", name="chk_positive_time_printed"),
    )

    hardware: Mapped["Hardware | None"] = relationship(
        "Hardware",
        back_populates="printing_model",
        uselist=False,
    )
    orders: Mapped[list["Order"]] = relationship("Order", back_populates="three_d_file")
