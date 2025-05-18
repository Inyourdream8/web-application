from flask import jsonify, request

def paginate(query, serializer=lambda x: x, per_page=10):
    page = request.args.get('page', 1, type=int)
    pagination = query.paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'items': [serializer(item) for item in pagination.items],
        'total': pagination.total,
        'pages': pagination.pages,
        'current_page': pagination.page,
        'per_page': pagination.per_page
    })