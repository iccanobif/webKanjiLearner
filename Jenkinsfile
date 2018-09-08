pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'cd web'
                sh 'npm install'
            }
        }
        stage('deploy') {
            steps {
                sh 'echo deploy >> /home/iccanobif/jenkinsWasHere'
            }
        }
    }
}