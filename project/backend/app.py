from flask import Flask, request, jsonify
from sqlalchemy import create_engine, inspect, text
from urllib.parse import quote_plus
import traceback
from flask_cors import CORS
import json
import boto3
from boto3.dynamodb.conditions import Key

app = Flask(__name__)
# Configure CORS to allow requests from both frontend and backend servers
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://localhost:5000"], "methods": ["GET", "POST", "OPTIONS"], "allow_headers": ["Content-Type", "Authorization"]}})

@app.route('/api/connect', methods=['POST'])
def connect_to_database():
    try:
        data = request.json
        conn_string = data.get('connectionString')
        db_type = data.get('dbType', 'mysql')
        
        print(f"Attempting to connect to database of type: {db_type}")
        
        if db_type == 'mysql':
            print(f"MySQL connection string: {conn_string[:20]}...")
            # Create SQLAlchemy engine for MySQL
            engine = create_engine(conn_string)
            
            # Test connection
            with engine.connect() as connection:
                # Get all table names
                inspector = inspect(engine)
                tables = inspector.get_table_names()
                print(f"MySQL tables found: {tables}")
                
            return jsonify({
                'success': True,
                'tables': tables
            })
        elif db_type == 'dynamodb':
            # Parse the connection info for DynamoDB
            try:
                print("Parsing DynamoDB connection info...")
                conn_info = json.loads(conn_string)
                region = conn_info.get('region_name')
                aws_access_key_id = conn_info.get('aws_access_key_id')
                aws_secret_access_key = conn_info.get('aws_secret_access_key')
                
                print(f"DynamoDB connection details - Region: {region}, Access Key ID: {aws_access_key_id[:5]}...")
                
                # Create DynamoDB client
                print("Creating DynamoDB client...")
                dynamodb = boto3.resource('dynamodb',
                    region_name=region,
                    aws_access_key_id=aws_access_key_id,
                    aws_secret_access_key=aws_secret_access_key
                )
                
                # List all tables
                print("Listing DynamoDB tables...")
                client = dynamodb.meta.client
                response = client.list_tables()
                tables = response.get('TableNames', [])
                print(f"DynamoDB tables found: {tables}")
                
                return jsonify({
                    'success': True,
                    'tables': tables
                })
            except json.JSONDecodeError as e:
                print(f"JSON decode error: {str(e)}")
                return jsonify({
                    'success': False,
                    'error': f'Invalid DynamoDB connection string format: {str(e)}'
                }), 400
            except Exception as e:
                print(f"DynamoDB connection error: {str(e)}")
                print(traceback.format_exc())
                return jsonify({
                    'success': False,
                    'error': f'DynamoDB connection error: {str(e)}'
                }), 500
        else:
            print(f"Unsupported database type: {db_type}")
            return jsonify({
                'success': False,
                'error': f'Unsupported database type: {db_type}'
            }), 400
    except Exception as e:
        print(f"General connection error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Add a route to handle OPTIONS requests for CORS preflight
@app.route('/api/tables/<table_name>/data', methods=['OPTIONS'])
def handle_options_table_data(table_name):
    return jsonify({
        'success': True,
        'message': 'CORS preflight request handled successfully'
    })

@app.route('/api/tables/<table_name>/data', methods=['POST'])
def get_table_data(table_name):
    try:
        data = request.json
        conn_string = data.get('connectionString')
        column = data.get('column')
        db_type = data.get('dbType', 'mysql')
        
        if db_type == 'mysql':
            # Create SQLAlchemy engine
            engine = create_engine(conn_string)
            
            # Get data from the specified table
            with engine.connect() as connection:
                # Always get all columns to ensure we have the complete table data
                query = text(f"SELECT * FROM {table_name} LIMIT 100")
                    
                result = connection.execute(query)
                columns = result.keys()
                rows = [dict(zip(columns, row)) for row in result.fetchall()]
                
                print(f"Fetched table data: {len(rows)} rows with {len(columns)} columns")
                if rows:
                    print(f"Sample columns: {list(rows[0].keys())[:5]}")
                    print(f"Sample row: {list(rows[0].values())[:5]}")
                
            return jsonify({
                'success': True,
                'columns': list(columns),
                'rawData': rows,
                'samples': rows[:5] if rows else []
            })
        elif db_type == 'dynamodb':
            try:
                conn_info = json.loads(conn_string)
                region = conn_info.get('region_name')
                aws_access_key_id = conn_info.get('aws_access_key_id')
                aws_secret_access_key = conn_info.get('aws_secret_access_key')
                
                # Create DynamoDB client
                dynamodb = boto3.resource('dynamodb',
                    region_name=region,
                    aws_access_key_id=aws_access_key_id,
                    aws_secret_access_key=aws_secret_access_key
                )
                
                # Get the table
                table = dynamodb.Table(table_name)
                
                # Scan the table (limit to 100 items)
                response = table.scan(Limit=100)
                items = response.get('Items', [])
                
                # Extract columns from the first item or return empty if no items
                columns = list(items[0].keys()) if items else []
                
                print(f"Fetched DynamoDB data: {len(items)} items with {len(columns)} attributes")
                if items:
                    print(f"Sample attributes: {list(items[0].keys())[:5]}")
                
                return jsonify({
                    'success': True,
                    'columns': columns,
                    'rawData': items,
                    'samples': items[:5] if items else []
                })
            except json.JSONDecodeError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid DynamoDB connection string format'
                }), 400
        else:
            return jsonify({
                'success': False,
                'error': f'Unsupported database type: {db_type}'
            }), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/tables/<table_name>/columns', methods=['POST'])
def get_table_columns(table_name):
    try:
        data = request.json
        conn_string = data.get('connectionString')
        db_type = data.get('dbType', 'mysql')
        
        if db_type == 'mysql':
            # Create SQLAlchemy engine
            engine = create_engine(conn_string)
            
            # Get columns for the specified table
            inspector = inspect(engine)
            columns = [column['name'] for column in inspector.get_columns(table_name)]
            
            return jsonify({
                'success': True,
                'columns': columns
            })
        elif db_type == 'dynamodb':
            try:
                conn_info = json.loads(conn_string)
                region = conn_info.get('region_name')
                aws_access_key_id = conn_info.get('aws_access_key_id')
                aws_secret_access_key = conn_info.get('aws_secret_access_key')
                
                # Create DynamoDB client
                dynamodb = boto3.resource('dynamodb',
                    region_name=region,
                    aws_access_key_id=aws_access_key_id,
                    aws_secret_access_key=aws_secret_access_key
                )
                
                # Get the table
                table = dynamodb.Table(table_name)
                
                # Get table description to extract attribute definitions
                client = dynamodb.meta.client
                response = client.describe_table(TableName=table_name)
                
                # Get a sample item to find all attributes (DynamoDB is schemaless)
                scan_response = table.scan(Limit=1)
                items = scan_response.get('Items', [])
                
                if items:
                    # Use the first item to get all attributes
                    columns = list(items[0].keys())
                else:
                    # If no items, use key schema from table description
                    key_schema = response['Table'].get('KeySchema', [])
                    columns = [key['AttributeName'] for key in key_schema]
                
                return jsonify({
                    'success': True,
                    'columns': columns
                })
            except json.JSONDecodeError:
                return jsonify({
                    'success': False,
                    'error': 'Invalid DynamoDB connection string format'
                }), 400
        else:
            return jsonify({
                'success': False,
                'error': f'Unsupported database type: {db_type}'
            }), 400
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/transform', methods=['POST'])
def transform_data():
    try:
        data = request.json
        conn_string = data.get('connectionString')
        table_name = data.get('tableName')
        column_name = data.get('columnName')
        transformation_code = data.get('transformationCode')
        transformation_type = data.get('transformationType')
        
        # Create SQLAlchemy engine
        engine = create_engine(conn_string)
        
        # In a real application, you would:
        # 1. Validate the transformation code (very important for security!)
        # 2. Apply the transformation to the database
        # 3. Return success/failure message
        
        # Here we just simulate successful transformation
        return jsonify({
            'success': True,
            'message': f'Successfully transformed column {column_name} in table {table_name}',
            'rowsAffected': 125  # Simulated number
        })
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/preview', methods=['POST'])
def preview_transformation():
    try:
        data = request.json
        conn_string = data.get('connectionString')
        table_name = data.get('tableName')
        column_name = data.get('columnName')
        transformation_code = data.get('transformationCode')
        
        # Create SQLAlchemy engine
        engine = create_engine(conn_string)
        
        # In a real application, you would:
        # 1. Execute a SELECT to get a sample of data
        # 2. Apply the transformation to the sample
        # 3. Return the before/after comparison
        
        # Here we just return mocked data
        with engine.connect() as connection:
            # Get a few sample rows
            sample_query = text(f"SELECT {column_name} FROM {table_name} LIMIT 5")
            result = connection.execute(sample_query)
            samples = [row[0] for row in result]
            
            # Mock transformed results (in a real app, you'd actually run the transformation)
            transformed = [f"Transformed: {sample}" for sample in samples]
            
            return jsonify({
                'success': True,
                'preview': {
                    'original': samples,
                    'transformed': transformed
                }
            })
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/execute-sql', methods=['POST'])
def execute_sql():
    try:
        data = request.json
        conn_string = data.get('connectionString')
        query = data.get('query')
        
        if not conn_string or not query:
            return jsonify({
                'success': False,
                'error': 'Connection string and query are required'
            }), 400
        
        print(f"Executing SQL query: {query[:100]}...")
        
        # Create SQLAlchemy engine
        engine = create_engine(conn_string)
        
        # Use engine.begin() to auto-handle transaction commit/rollback
        with engine.begin() as connection:
            # Execute the query
            result = connection.execute(text(query))
            
            # If the query is a SELECT query, return the results
            if query.strip().upper().startswith('SELECT'):
                columns = result.keys()
                rows = [dict(zip(columns, row)) for row in result.fetchall()]
                
                print(f"Query returned {len(rows)} rows")
                
                return jsonify({
                    'success': True,
                    'results': rows
                })
            # For non-SELECT queries (CREATE, INSERT, UPDATE, DELETE)
            else:
                return jsonify({
                    'success': True,
                    'message': 'Query executed successfully'
                })
    except Exception as e:
        print(f"SQL execution error: {str(e)}")
        print(traceback.format_exc())
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500


import io
import csv

@app.route('/api/save-joined-table', methods=['POST'])
def save_joined_table():
    try:
        data = request.json
        conn_string = data.get('connectionString')
        table_name = data.get('tableName')
        rows = data.get('data')  # Should be a list of dicts
        db_type = data.get('dbType', 'mysql')

        if not all([conn_string, table_name, rows]):
            return jsonify({'success': False, 'error': 'Missing required parameters.'}), 400

        if db_type != 'mysql':
            return jsonify({'success': False, 'error': 'Only MySQL is supported for saving joined tables.'}), 400

        engine = create_engine(conn_string)
        with engine.connect() as connection:
            # Drop table if exists
            connection.execute(text(f"DROP TABLE IF EXISTS `{table_name}`"))
            # Create table based on keys in first row
            columns = rows[0].keys()
            col_defs = ', '.join([f'`{col}` TEXT' for col in columns])
            connection.execute(text(f"CREATE TABLE `{table_name}` ({col_defs})"))
            # Insert rows
            for row in rows:
                keys = ', '.join([f'`{col}`' for col in row.keys()])
                values = ', '.join([f':{col}' for col in row.keys()])
                sql = text(f"INSERT INTO `{table_name}` ({keys}) VALUES ({values})")
                connection.execute(sql, **row)
        return jsonify({'success': True, 'message': f'Joined table {table_name} saved to SQL.'})
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/export-joined-table', methods=['POST'])
def export_joined_table():
    try:
        data = request.json
        conn_string = data.get('connectionString')
        table_name = data.get('tableName')
        db_type = data.get('dbType', 'mysql')

        if not all([conn_string, table_name]):
            return jsonify({'success': False, 'error': 'Missing required parameters.'}), 400
        if db_type != 'mysql':
            return jsonify({'success': False, 'error': 'Only MySQL is supported for exporting joined tables.'}), 400

        engine = create_engine(conn_string)
        with engine.connect() as connection:
            try:
                result = connection.execute(text(f'SELECT * FROM `{table_name}`'))
                rows = result.fetchall()
                columns = result.keys()
                output = io.StringIO()
                writer = csv.writer(output)
                writer.writerow(columns)
                for row in rows:
                    writer.writerow(row)
                output.seek(0)
                return app.response_class(
                    output.getvalue(),
                    mimetype='text/csv',
                    headers={
                        'Content-Disposition': f'attachment; filename={table_name}.csv'
                    }
                )
            except Exception as e:
                print(f'Error exporting table {table_name}:', str(e))
                print(traceback.format_exc())
                return jsonify({'success': False, 'error': f'Failed to export table: {str(e)}'}), 500
    except Exception as e:
        print(traceback.format_exc())
        return jsonify({'success': False, 'error': str(e)}), 500

if __name__== '__main__':
    print("Starting Flask server with CORS support on port 5001...")
    print("API endpoints available at: http://localhost:5001/api/")
    app.run(debug=True, port=5001)