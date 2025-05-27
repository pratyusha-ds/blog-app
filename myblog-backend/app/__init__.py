from flask import Flask, request, jsonify
from pymongo import MongoClient
from dotenv import load_dotenv
import os
from .schema import schema
from flask_cors import CORS 

load_dotenv()

def create_app():
    app = Flask(__name__)
    CORS(app) 

    mongo_uri = os.getenv("MONGO_URI")
    client = MongoClient(mongo_uri)
    db_name = "myblogdb"
    app.db = client[db_name]

    @app.route("/graphql", methods=["GET"])
    def graphql_playground():
        return """
        <!DOCTYPE html>
        <html>
        <head>
          <title>GraphiQL</title>
          <link href="https://unpkg.com/graphiql/graphiql.min.css" rel="stylesheet" />
        </head>
        <body style="margin: 0;">
          <div id="graphiql" style="height: 100vh;"></div>
          <script crossorigin src="https://unpkg.com/react/umd/react.production.min.js"></script>
          <script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
          <script src="https://unpkg.com/graphiql/graphiql.min.js"></script>
          <script>
            const fetcher = graphQLParams =>
              fetch('/graphql', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(graphQLParams),
                credentials: 'same-origin',
              }).then(r => r.json());
            ReactDOM.render(
              React.createElement(GraphiQL, { fetcher }),
              document.getElementById('graphiql'),
            );
          </script>
        </body>
        </html>
        """


    @app.route("/graphql", methods=["POST"])
    def graphql_server():
        data = request.get_json()
        result = schema.execute(
            data.get("query"),
            variable_values=data.get("variables"),
            context_value={"db": app.db, "request": request},
            operation_name=data.get("operationName")
        )
        response = {}
        if result.errors:
            response["errors"] = [str(e) for e in result.errors]
        if result.data:
            response["data"] = result.data
        return jsonify(response)

    return app