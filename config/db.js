const mongoose = require('mongoose');
mongoose
    .connect(
        process.env.DB_CONNECT,
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    .then(() => console.log('Connecté à la base de donnée Distante.'))
    .catch((err) => console.log('Echec de connexion à la base de donnée', err));

//Créer un fichier ".env" dans ce dossier (config) avec les variable d'environnement telles que le shema suivant:
//PORT=5000
//DB_CONNECT=mongodb+srv://ATLAS_USER:ATLAS_PASSWORD@ATLAS_HOSTNAME/ATLAS_DB
//TOKEN_SECRET= JWT Web Token
//POSITION_STACK_ACCESS_KEY=**** généré sur https://positionstack.com/