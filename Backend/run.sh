#!/bin/sh

daphne -b 0.0.0.0 -p 8000 quiz_manager.asgi:application
