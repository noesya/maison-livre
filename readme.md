# Zombitron virus, version web

## Setup serveur

1. Choisir un vieil Android pour le transformer en serveur-zombitron.
2. Installer [Termux](https://play.google.com/store/apps/details?id=com.termux) sur l'appareil
3. Lancer Termux et installer node, git et yarn
  ```
  pkg install nodejs git yarn
  ```
4. Cloner le repo
  ```
  git clone https://github.com/noesya/zombitron.web
  ```
5. Rentrer dans le dossier, installer les dépendances
  ```
  cd zombitron.web
  yarn install
  ```
6. Lancer le serveur
  ```
  yarn start
  ```
7. Visiter les différents hacks avec d'autres vieux téléphones qui doivent être sur le même réseau ou sur le réseau du serveur-zombitron :
  - le controlleur : `http://[ZOMBITRON_SERVEUR_IP]/`
  - l'image : `http://[ZOMBITRON_SERVEUR_IP]/shader`
  - l'audio : `http://[ZOMBITRON_SERVEUR_IP]/sound`

## Mise à jour

Pour avoir la dernière version du code, lancer `git pull` dans le répertoire du projet, puis relancer le serveur.

## Pour se connecter depuis son ordi au zombitron serveur

### Setup serveur

1. Installer OpenSSH
  ```
  pkg install openssh
  ```
2. Lancer le serveur SSH
  ```
  sshd
  ```
3. Configurer le mot de passe utilisateur avec la commande `passwd`.

### Connexion client

Dans un terminal : `ssh [ZOMBITRON_SERVEUR_IP] -p 8022` et entrer le mot de passe.
