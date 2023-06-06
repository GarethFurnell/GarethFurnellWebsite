import pymongo

# Create a connection string for your MongoDB database.
connection_string = "mongodb+srv://Chronos:Chronos@clusterzero.ll755st.mongodb.net/"

# Create a new MongoClient instance.
client = pymongo.MongoClient(connection_string)

# Get the database object.
db = client.get_database("londonBikes")

# Get the collection object.
collection = db.get_collection("bikeRides")


from database import collection

# Query the database for all documents that contain the latitude and longitude fields.
documents = collection.find({"start station latitude": {"$exists": True}, "start station longitude": {"$exists": True}})

# Iterate through the documents and print the latitude and longitude values.
for document in documents:
    print(document["latitude"], document["longitude"])
    
