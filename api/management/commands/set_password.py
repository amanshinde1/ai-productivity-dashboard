from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

class Command(BaseCommand):
    help = 'Sets the password for an existing user'

    def handle(self, *args, **options):
        User = get_user_model()
        user = User.objects.get(username='peace123')
        user.set_password('V7m!qL9z$3xRp2wA')
        user.save()
        print("Password reset successful.")
