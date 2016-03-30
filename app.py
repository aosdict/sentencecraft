from flask import Flask
from flask import request # lets us access request parameters
from flask.ext.pymongo import PyMongo
from bson.json_util import dumps
import flask

app = Flask("app")
mongo = PyMongo(app)

# To manually insert sentences into the database
# > mongo
# > use app
# > db.sentences.insert({"content": "Illuminati confirmed." 
#                "complete": true})

# To insert from a file
# > "mongo < insert-sentences.txt"

# View the API endpoint
# > python app.py
# > 127.0.0.1:5000/view-sentences

@app.route('/view-sentences/')
def api_view_sentences():
<<<<<<< HEAD
    #count = request.args.get('count')
    # TODO: use count to limit the number of sentences
    sentences = mongo.db.sentences.find({'complete':True})
    #return 'Your count was '+count+' '+dumps(sentences)
    test = mongo.db.sentences.find()
    return dumps(test)
	
@app.route('/view-HTML')
def view_HTML_sample():
	sentences = mongo.db.sentences.find()
	return flask.render_template('index.html', sentences = sentences)
=======
    count = request.args.get('count')
    if (count is None): count = '10'

    try: i_count = int(count)
    except ValueError: i_count = 10 

    sentences = mongo.db.sentences.find({'complete':True}).sort("_id", -1).limit(int(count))
    return 'Your count was '+count+' '+dumps(sentences)
>>>>>>> 4662d52022035e5bf60eb93d776de70da6eb9942

if __name__ == '__main__':
    app.run(debug=True)
