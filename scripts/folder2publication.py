import os
import xml.etree.ElementTree as ET
import logging
from setup import *
from general import *

logging.basicConfig(filename="folder2publication.txt",
                level=logging.DEBUG,
                format='%(levelname)s: %(asctime)s %(message)s',
                datefmt='%m/%d/%Y %I:%M:%S')

# Get the folder structure, path defined in .env
paths = getFolderStructure()

previousPublicationName = None
previousFacsimileCollectionId = None
# Loop through the files, extract the folders and file names
for path in paths:
    fullPath = str(os.sep).join(path)
    collectionName = path[len(path) - 3]
    publicationName = path[len(path) - 2]
    fileName = path[len(path) - 1]
    # Get the file number (page number) from the filename. 
    # This needs to have a fail over
    fileNumber = re.sub('^0+', '', (re.sub('\D', '', fileName)))
    
    # Only create a new publication if the publication name changes
    if previousPublicationName is None or previousPublicationName != publicationName:
        # Create the Publication
        pubId = createPublication(PUBLICATION_COLLECTION_ID, publicationName, PUBLICATION_STATUS, PUBLICATION_GENRE)
        logging.info('Added publication id ' + str(pubId) + ": " + publicationName + " - " + fileName)
        
        # Create the Facsimile Collection
        facsColId = createFacsimileCollection(publicationName, collectionName + " - " + publicationName)
        logging.info('Added FacsimileCollection id ' + str(facsColId) + ": " + collectionName + " - " + publicationName)
        
        # Create the Facsimile, connect it to the Publication and Collection
        createFacsimile(facsColId, pubId)
        logging.info('Added Facsimile')
        
        previousFacsimileCollectionId = facsColId
        previousPublicationName = publicationName
    
    if previousPublicationName is not None:
        # Update number of pages for collection
        updateFacsimileCollection(previousFacsimileCollectionId, fileNumber)
        # Create the folder
        createFacsimileCollectionFolder(previousFacsimileCollectionId)
        moveJPGToFacsimileCollectionFolder(fullPath, previousFacsimileCollectionId, fileNumber)
    else:
        logging.error('Publication name or id missing')
    
    conn_new_db.commit()

conn_new_db.close()