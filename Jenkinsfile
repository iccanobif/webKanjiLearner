pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'cd web && npm install'
                // Would be nice to also install pm2
            }
        }
        stage('deploy') {
            steps {
                sh 'pm2 delete kanjiLearning ; true'
                echo 'Starting new process'
                sh 'chmod +x run.sh'
                sh 'pm2 start run.sh --name kanjiLearning'
            }
        }
    }
}