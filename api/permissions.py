# api/permissions.py

from rest_framework import permissions


class ReadOnlyOrIsAuthenticated(permissions.BasePermission):
    """
    Custom permission to only allow authenticated users to edit objects,
    but allow read-only access to anyone (authenticated or not).
    """

    def has_permission(self, request, view):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD, or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Write permissions are only allowed to authenticated users.
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request.
        if request.method in permissions.SAFE_METHODS:
            return True

        # Object-level write permissions are only allowed to the owner of the object.
        # This assumes your model has an 'owner' field.
        return obj.owner == request.user

