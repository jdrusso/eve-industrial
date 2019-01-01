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

# session = {"item": None, "quantity": None, "multibuy_minerals": None}

shekelator_path = '../../shekelator'
sys.path.append(shekelator_path)
from shekelator import analyze

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', 'http://localhost:3000')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,OPTIONS,PUT,POST,DELETE')
    return response

@app.route('/set/')
def set():
	session['key'] = 'value'
	session.modified = True
	print(session)
	return 'ok'

@app.route('/get/')
def get():
	print(session)
	# print(session['key'])
	return session.get('key', 'not set')


@app.route('/clear')
def clear():
	try:

		session.clear()
		print("\nClearing session" % session.sid)
		print(session, end = ' ')
	# print(session.sid)
		session = {}
		print(session, end = ' ')
		print("\nCleared %s" % session.sid)
	except UnboundLocalError:
		print("nothing")
	# print(type(session))
	# session['item'] = None
	# session['quantity'] = None
	# session['multibuy_minerals'] = None
	# session['multibuy_ore'] = None
	return "Clear"


def read_analyze(session):
	session.modified = False

	# TODO: Spawn the shekelator here
	parent_conn, child_conn = Pipe()

	print("Spawning shekelator")
	p = Process(target=analyze, args=(session["item"], session["quantity"], True, child_conn))
	p.start()

	print("Receiving:")
	print(parent_conn.recv())

	print("Multibuy:")
	# Get string IO object
	piped_minerals = parent_conn.recv()
	piped_minerals.seek(0)
	session["multibuy_minerals"] = piped_minerals.read()
	print("mineral multibuy obtained: %s" % session["multibuy_minerals"])


	# Get string IO object
	piped_ore = parent_conn.recv()
	piped_ore.seek(0)
	session["multibuy_ore"] = piped_ore.read()
	print("ore multibuy obtained: %s" % session["multibuy_ore"])

	print("Shekelator finished, %s %d " % (session.sid, id(session)))
	print("Shekelator: %s" % session)
	session.modified = True



@app.route("/post_test", methods=['POST'])
def show_post():

	session.clear()
	print("\nStarting with session %s" % id(session))

	# session = {"item": None, "quantity": None, "multibuy_minerals": None}
	# session['item'] = None
	# session['quantity'] = None
	# session['multibuy_minerals'] = None
	# session['multibuy_ore'] = None

	print(request.json)
	data = request.json['data']
	item = data['item']
	quantity = int(data['quantity'])

	session["item"] = item
	session["quantity"] = int(quantity)

	response = "Looking up information for {0}x {1}(s)...\n".format(quantity, item)

	# TODO: Spawn the shekelator here
	parent_conn, child_conn = Pipe()

	# p = Process(target=read_analyze, args=(session,))
	# p.start()
	print("Background process spawned")

	# session['multibuy_ore'] = 'Ores!!'
	# session['multibuy_minerals'] = 'Minerals'

	print("\n\n ***** regular process session %s" % session)
	print("session id was %d *** \n\n" % id(session))



	parent_conn, child_conn = Pipe()

	print("Spawning shekelator")
	p = Process(target=analyze, args=(session["item"], session["quantity"], True, child_conn))
	p.start()

	print("Receiving:")
	print(parent_conn.recv())

	print("Multibuy:")
	# Get string IO object
	piped_minerals = parent_conn.recv()
	piped_minerals.seek(0)
	session["multibuy_minerals"] = piped_minerals.read()
	print("mineral multibuy obtained: %s" % session["multibuy_minerals"])


	# Get string IO object
	piped_ore = parent_conn.recv()
	piped_ore.seek(0)
	session["multibuy_ore"] = piped_ore.read()
	print("ore multibuy obtained: %s" % session["multibuy_ore"])

	print("Shekelator finished, %s %d " % (session.sid, id(session)))
	print("Shekelator: %s" % session)
	session.modified = True



	print(session)


	return response

@app.route("/multibuy_minerals")
def multibuy_minerals():

	print("\nAttempting to read minerals\n")

	text = ""

	while True:
		try:
			text = session["multibuy_minerals"]
		except KeyError:
			time.sleep(2.5)
			# print(session)
		else:
			break

	print("Mineral multibuy produced")

	multibuy_minerals = jsonify(session["multibuy_minerals"])
	return  multibuy_minerals

@app.route("/multibuy_ore")
def multibuy_ore():

	print("\nAttempting to read ores\n")

	num = 0

	while True:
		try:
			temp = session
			# print(SESSION_COOKIE_NAME)
			print(' \r', end='')
			print(temp.sid, end = '\t')
			print(id(temp), end = '\t')
			print(temp, end = '')
			print(" %d attempts" % num, end='\r')
			num += 1
			text = temp["multibuy_ore"]
		except KeyError:
			time.sleep(2.5)
		else:
			break

	print("Ore multibuy produced - %s" % session["multibuy_ore"])

	multibuy_ore = jsonify(session["multibuy_ore"])
	return  multibuy_ore

@app.route("/get_test", methods=['GET'])
def hello():

	response =  "We've been trying to build {0} {1}(s).".format(session["quantity"], session["item"])
	return response

if __name__ == "__main__":
	# app.config['SECRET_KEY'] = "420yoloswag"
	# app.secret_key = "520yoloswag"
	app.run(host='127.0.0.1', port=5000)
