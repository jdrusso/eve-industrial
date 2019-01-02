import sys
from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_session import Session
from multiprocessing import Process, Pipe
import time


app = Flask(__name__)
SESSION_TYPE = 'redis'
SESSION_COOKIE_HTTPONLY = False
REMEMBER_COOKIE_HTTPONLY = False
app.config.from_object(__name__)
app.secret_key = b'123456782'
Session(app)
CORS(app, supports_credentials=True, resources={r"/*": {"origins": "*"}})

import os
dir = os.path.dirname(os.path.realpath(__file__))
krab_path = os.path.join(dir, 'krabby-patty/')
sys.path.append(krab_path)

from krabby_patty import analyze

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,POST,DELETE')
    return response


@app.route('/clear')
def clear():

    try:
        session.clear()
        print("\nClearing session")

    except UnboundLocalError:
        pass

    return "Clear"


@app.route("/post_test", methods=['POST'])
def show_post():

    session.clear()

    data = request.json['data']
    item = data['item']
    quantity = int(data['quantity'])

    session["item"] = item
    session["quantity"] = int(quantity)

    response = "Looking up information for {0}x {1}(s)...\n".format(quantity, item)

    parent_conn, child_conn = Pipe()

    print("Spawning krabby patty")
    p = Process(target=analyze, args=(session["item"], session["quantity"], True, child_conn))
    p.start()

    # Receive the initialization string
    recvd = parent_conn.recv()

    # print("Multibuy:")
    # Get string IO object
    piped_minerals = parent_conn.recv()
    piped_minerals.seek(0)
    session["multibuy_minerals"] = piped_minerals.read()
    print("Mineral multibuy obtained")


    # Get string IO object
    piped_ore = parent_conn.recv()
    piped_ore.seek(0)
    session["multibuy_ore"] = piped_ore.read()
    print("Ore multibuy obtained")

    piped_prices = parent_conn.recv()
    session['mineral_names'], session["materials_used"], session["materials_required"], session["materials_excess"] = piped_prices
    print("Materials obtained")

    print("Krabby patty finished")
    session.modified = True

    return response



def wait_value(key):

	print("\nAttempting to read %s\n" % key)

	text = ""

	while True:
		try:
			text = session[key]
		except KeyError:
			time.sleep(2.5)
		else:
			break

	print("%s produced" % key)

	result = jsonify(session[key])
	return  result


@app.route("/multibuy_minerals")
def multibuy_minerals():

	result = wait_value('multibuy_minerals')

	return result

@app.route("/multibuy_ore")
def multibuy_ore():

	result = wait_value('multibuy_ore')

	return result

@app.route("/material_table")
def materials_table():

    response = list(zip(
        session['mineral_names'],
        session['materials_used'],
        session['materials_required'],
        session['materials_excess']))

    print("Sending")

    return jsonify(response)

@app.route("/build_price")
def build_price():

	result = wait_value('build_price')
	return result


@app.route("/get_test", methods=['GET'])
def hello():

	response =  "We've been trying to build {0} {1}(s).".format(session["quantity"], session["item"])
	return response

if __name__ == "__main__":
	# app.config['SECRET_KEY'] = "420yoloswag"
	# app.secret_key = "520yoloswag"
	app.run(host='127.0.0.1', port=5000)
