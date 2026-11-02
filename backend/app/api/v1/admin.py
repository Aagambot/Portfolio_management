from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.database import get_db
from backend.app.models.user import User
from backend.app.models.portfolio import Portfolio
from backend.app.models.transaction import Transaction
from backend.app.api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["Admin Monitoring"])


@router.get("/stats")
def get_system_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve administrative metrics and observability audit counts."""
    total_users = db.query(User).count()
    total_portfolios = db.query(Portfolio).count()
    total_transactions = db.query(Transaction).count()
    active_users = db.query(User).filter(User.is_active == True).count()

    return {
        "status": "healthy",
        "total_users": total_users,
        "active_users": active_users,
        "total_portfolios": total_portfolios,
        "total_transactions": total_transactions,
        "monitored_region": "ap-south-1 (Mumbai)",
        "admin_email": admin.email
    }
