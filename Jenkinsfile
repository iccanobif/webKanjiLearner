pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'cd web && npm install'
            }
        }
        stage('deploy') {
            steps {
                sh 'echo deploy >> /home/iccanobif/jenkinsWasHere'
            }
        }
    }
}