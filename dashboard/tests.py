# -*- coding: utf-8 -*-
from __future__ import unicode_literals
from django.test import TestCase
from .models import *


class _coreAPI3(TestCase):
    def setUp(self):
        self.good_credentials = {
        "content" : "Hello world",
        "session": 1
    }

    def test_login(self):
        response = self.client.post('/_core/api/session/4', **self.good_credentials)
        self.assertTrue(response)


class _coreAPI4(TestCase):
    def setUp(self):
        self.good_credentials = {
        "content" : "Hello world",
    }

    def test_login(self):
        response = self.client.post('/_core/api/session/4', **self.good_credentials)
        self.assertTrue(response.status_code == 301)


class _coreAPI5(TestCase):

    def test_login(self):
        response = self.client.get('/_core/api/session/4')
        self.assertTrue(response)


class _coreAPI6(TestCase):

    def test_login(self):
        response = self.client.get('/_core/api/session/4')
        self.assertTrue(response.status_code == 301)



