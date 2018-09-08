pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'echo build >> /home/iccanobif/jenkinsWasHere'
            }
        }
        stage('deploy') {
            steps {
                sh 'echo deploy >> /home/iccanobif/jenkinsWasHere'
            }
        }
    }
}