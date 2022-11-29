module.exports.signUpErrors = (err) => {
    let errors = { pseudo: '', email: '', password: ''}

    if(err.message.includes('pseudo'))
        errors.pseudo = "Pseudo incorrect ou déjà pris";

    if(err.message.includes('email'))
        errors.email = "Addresse email incorrecte";

    if(err.message.includes('password'))
        errors.password = "Mot de passe incorrect, il doit faire 6 caractères minimum";

    if(err.code === 11000 && Object.keys(err.keyValue)[0].includes('pseudo'))
        errors.pseudo = "Ce pseudo est déjà pris";
    
    if(err.code === 11000 && Object.keys(err.keyValue)[0].includes('email'))
        errors.email = "Cette addresse email est déjà enregistrée";
                
    return errors;
}

module.exports.signInErrors = (err) => {
    let errors = { email: '', password: ''}

    if (err.message.includes("email"))
        errors.email = "Email inconnu";
    
    if (err.message.includes("password"))
        errors.password = "Mot de passe érroné";

    return errors;
}

module.exports.uploadErrors = (err) => {
    let errors = { format: '', maxSize: ''};

    if (err.message.includes("invalid file"))
        errors.format = "Fichier au mauvais format";
    if (err.message.includes("max size"))
        errors.maxSize = "Fichier trop volumineux (max 500ko)";
    
    return errors;
}

module.exports.deletePictureErrors = (err) => {
    let errors = { index: ''};

    if (err.message.includes("invalid index"))
        errors.index = "Index de l'image introuvable";
    return errors;
}

module.exports.deleteUserPictureErrors = (err) => {
    let errors = { index: ''};

    if (err.message.includes("invalid index"))
        errors.index = "Index de l'image introuvable";
    return errors;
}