# api/pagination.py
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from collections import OrderedDict

class SafePageNumberPagination(PageNumberPagination):
    page_size = 3  # same as your settings.PAGE_SIZE

    def paginate_queryset(self, queryset, request, view=None):
        try:
            return super().paginate_queryset(queryset, request, view=view)
        except Exception:
            # When page is out of range, return empty list
            self.page = None
            return []

    def get_paginated_response(self, data):
        return Response(OrderedDict([
            ('count', self.page.paginator.count if self.page else 0),
            ('next', self.get_next_link() if self.page else None),
            ('previous', self.get_previous_link() if self.page else None),
            ('results', data)
        ]))
