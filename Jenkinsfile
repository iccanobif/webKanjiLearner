pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                sh 'cd web && npm install'
                // Would be nice to also install pm2
                // And here there should be tests!
            }
        }
        stage('deploy') {
            steps {
                sh 'pm2 delete kanjiLearning || true'
                sh 'cd ~/webKanjiLearner && git pull && npm install'
                sh 'cd ~/webKanjiLearner && pm2 start run.sh --name kanjiLearning'
            }
        }
    }
}