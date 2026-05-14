import pytest

from app import app
from models import User, db
from werkzeug.security import generate_password_hash

NONEXISTENT_USER_ID = 999999


@pytest.fixture
def dashboard_user():
    with app.app_context():
        user = User.query.filter_by(username='admin').first()
        assert user is not None
        yield user


def test_dashboard_redirects_when_session_user_is_missing():
    client = app.test_client()
    with client.session_transaction() as sess:
        sess['user_id'] = NONEXISTENT_USER_ID
        sess['username'] = 'ghost'
        sess['is_admin'] = False
        sess['is_active'] = True

    response = client.get('/user/dashboard')

    assert response.status_code == 302
    assert '/login' in response.headers['Location']


def test_dashboard_renders_for_valid_session(dashboard_user):
    client = app.test_client()
    with client.session_transaction() as sess:
        sess['user_id'] = dashboard_user.id
        sess['username'] = dashboard_user.username
        sess['is_admin'] = dashboard_user.is_admin
        sess['is_active'] = dashboard_user.is_active

    response = client.get('/user/dashboard')

    assert response.status_code == 200
    body = response.get_data(as_text=True)
    assert 'profileModal' in body
    assert dashboard_user.username in body
