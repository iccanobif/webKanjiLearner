pipeline {
    agent any
    stages {
        stage('build') {
            steps {
                // Would be nice to also install pm2

                // download tatoeba datasets 
                // generate kana sentences
                // aggregate sentences into allSentences.csv
                sh 'cd src && npm install'
            }
        }
        // stage('test') {
        //     steps {
        //         sh 'cd src && npm test'
        //     }
        // }
        stage('deploy') {
            steps {
                sh 'pm2 delete kanjiLearning || true'
                sh 'cd ~/webKanjiLearner && git pull && npm install'
                sh 'cd ~/webKanjiLearner/src && pm2 start "npm start"'
            }
        }
    }
}