from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from db import Customer, Order, OrderGroup, ThreeDFile


class OrderRepository:
    def list_groups(self, session: Session) -> list[OrderGroup]:
        return list(
            session.scalars(
                select(OrderGroup)
                .options(selectinload(OrderGroup.orders))
                .order_by(OrderGroup.id)
            )
        )

    def get_group(self, session: Session, order_group_id: int) -> OrderGroup | None:
        return session.scalar(
            select(OrderGroup)
            .options(selectinload(OrderGroup.orders))
            .where(OrderGroup.id == order_group_id)
        )

    def create_group_with_order(
        self,
        session: Session,
        order_group_data: dict,
        order_data: dict,
    ) -> OrderGroup:
        self._validate_group_relations(session, order_group_data)
        self._validate_order_relations(session, order_data)

        order_group = OrderGroup(**order_group_data)
        order_group.orders.append(Order(**order_data))
        session.add(order_group)
        session.flush()
        return order_group

    def list(self, session: Session) -> list[Order]:
        return list(session.scalars(select(Order).order_by(Order.id)))

    def get(self, session: Session, order_id: int) -> Order | None:
        return session.get(Order, order_id)

    def create(self, session: Session, order_data: dict) -> Order:
        self._validate_order_relations(session, order_data)

        order = Order(**order_data)
        session.add(order)
        session.flush()
        return order

    def update(self, session: Session, order_id: int, order_data: dict) -> Order | None:
        order = self.get(session, order_id)
        if order is None:
            return None

        self._validate_order_relations(session, order_data)

        for field, value in order_data.items():
            setattr(order, field, value)

        session.flush()
        return order

    def delete(self, session: Session, order_id: int) -> bool:
        order = self.get(session, order_id)
        if order is None:
            return False

        session.delete(order)
        session.flush()
        return True

    def _validate_group_relations(self, session: Session, order_group_data: dict) -> None:
        customer_id = order_group_data.get("customer_id")
        if customer_id is not None and session.get(Customer, customer_id) is None:
            raise ValueError("Customer not found")

    def _validate_order_relations(self, session: Session, order_data: dict) -> None:
        order_group_id = order_data.get("order_group_id")
        if order_group_id is not None and session.get(OrderGroup, order_group_id) is None:
            raise ValueError("Order group not found")

        three_d_file_id = order_data.get("three_d_file_id")
        if three_d_file_id is not None and session.get(ThreeDFile, three_d_file_id) is None:
            raise ValueError("3D file not found")
