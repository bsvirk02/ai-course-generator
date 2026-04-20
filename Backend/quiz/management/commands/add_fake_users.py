import random
import os
from django.conf import settings
from django.core.management.base import BaseCommand
from faker import Faker
from django.core.files import File
from quiz.models import User
from django.contrib.auth import get_user_model

user = get_user_model()

class Command(BaseCommand):
    help = "Seed the database with test users for leaderboard"

    def handle(self, *args, **kwargs):
        fake = Faker()
        total_users = 19 

        ethnicities = ["Asian", "Black", "White", "Mixed", "Other"]
        sexualities = ["Straight", "Gay", "Bisexual", "Other"]
        religions = ["Christianity", "Islam", "Hinduism", "Sikhism", "Other"]

        defaultPic_path = os.path.join(settings.MEDIA_ROOT, "profile_pics/IMG_1303.png")


        for _ in range(total_users):
            with open(defaultPic_path, "rb") as img_file:
                user = User.objects.create_user(
                    username=fake.name(),  
                    email=fake.email(),
                    password=fake.password(),  
                    user_id=fake.uuid4(),  
                    name=fake.name(),
                    country=fake.country(),
                    points_count=100001,
                    current_streak=random.randint(0, 10),
                    ATH_streak=random.randint(10, 30),
                    role="employee",
                    ethnicity=random.choice(ethnicities),
                    sexuality=random.choice(sexualities),
                    religion=random.choice(religions),
                    bio=fake.text(max_nb_chars=150),
                )
                user.profile_picture.save(f"profile_{user.user_id}.png", File(img_file), save=True)


        self.stdout.write(self.style.SUCCESS(f"Successfully created {total_users} fake users."))
