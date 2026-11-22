"""Tiny fixture repo for demonstrating regression gates."""


def subtotal(prices: list[float]) -> float:
    if any(p < 0 for p in prices):
        raise ValueError("Negative prices are not permitted")
    return round(sum(prices), 2)
