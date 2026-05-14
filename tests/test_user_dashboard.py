from app import app
from models import User, db
from werkzeug.security import generate_password_hash


def _ensure_admin_user():
    with app.app_context():
        user = User.query.filter_by(username='admin').first()
        if user:
            return user

        user = User(
            username='admin',
            email='admin@example.com',
            password_hash=generate_password_hash('admin123'),
            is_active=True,
            is_admin=True,
        )
        db.session.add(user)
        db.session.commit()
        return user


def test_dashboard_redirects_when_session_user_is_missing():
    client = app.test_client()
    with client.session_transaction() as sess:
        sess['user_id'] = 999999
        sess['username'] = 'ghost'
        sess['is_admin'] = False
        sess['is_active'] = True

    response = client.get('/user/dashboard')

    assert response.status_code == 302
    assert '/login' in response.headers['Location']


def test_dashboard_renders_for_valid_session():
    user = _ensure_admin_user()
    client = app.test_client()
    with client.session_transaction() as sess:
        sess['user_id'] = user.id
        sess['username'] = user.username
        sess['is_admin'] = user.is_admin
        sess['is_active'] = user.is_active

    response = client.get('/user/dashboard')

    assert response.status_code == 200
    body = response.get_data(as_text=True)
    assert 'profileModal' in body
