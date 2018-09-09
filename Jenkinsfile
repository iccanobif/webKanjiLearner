pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                // Would be nice to also install pm2
                // And here there should be tests!
                sh 'cd web && pwd && npm install'
            }
        }
        stage('deploy') {
            steps {
                sh 'pm2 delete kanjiLearning || true'
                sh 'cd ~/webKanjiLearner && git pull && npm install'
                sh 'cd ~/webKanjiLearner/web && pm2 start kanjiLearning.js'
            }
        }
    }
}