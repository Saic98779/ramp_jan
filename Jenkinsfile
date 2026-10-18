// Builds the Angular frontend as a Docker image and deploys it to 51.222.221.25
// (served at https://ramp-tg.metaversedu.in).
//
// Jenkins prerequisites:
//   - Agent with Docker installed and the "SSH Agent" plugin
//   - SSH credential (username + private key) with id 'ramp-tg-server-ssh'
//     for a user on the server that can run docker
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        APP_NAME        = 'ramp-tg-frontend'
        IMAGE_TAG       = "${env.BUILD_NUMBER}"
        DEPLOY_HOST     = '51.222.221.25'
        DEPLOY_USER     = 'ubuntu'
        SSH_CREDENTIALS = 'workflow-server-ssh'
        HOST_PORT       = '8090'   // host nginx proxies ramp-tg.metaversedu.in -> 127.0.0.1:8090
        BASE_HREF       = '/'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Docker image') {
            steps {
                sh """
                    docker build \
                        --build-arg BASE_HREF=${BASE_HREF} \
                        -t ${APP_NAME}:${IMAGE_TAG} \
                        -t ${APP_NAME}:latest \
                        .
                """
            }
        }

        stage('Ship image to server') {
            steps {
                sshagent(credentials: [env.SSH_CREDENTIALS]) {
                    sh """
                        docker save ${APP_NAME}:${IMAGE_TAG} | gzip | \
                            ssh -o StrictHostKeyChecking=accept-new ${DEPLOY_USER}@${DEPLOY_HOST} 'gunzip | docker load'
                    """
                }
            }
        }

        stage('Deploy') {
            steps {
                sshagent(credentials: [env.SSH_CREDENTIALS]) {
                    sh """
                        ssh -o StrictHostKeyChecking=accept-new ${DEPLOY_USER}@${DEPLOY_HOST} '
                            set -e
                            docker rm -f ${APP_NAME} 2>/dev/null || true
                            docker run -d \
                                --name ${APP_NAME} \
                                --restart unless-stopped \
                                -p 127.0.0.1:${HOST_PORT}:80 \
                                ${APP_NAME}:${IMAGE_TAG}
                            docker tag ${APP_NAME}:${IMAGE_TAG} ${APP_NAME}:latest
                        '
                    """
                }
            }
        }

        stage('Health check') {
            steps {
                sshagent(credentials: [env.SSH_CREDENTIALS]) {
                    sh """
                        ssh -o StrictHostKeyChecking=accept-new ${DEPLOY_USER}@${DEPLOY_HOST} '
                            for i in \$(seq 1 10); do
                                curl -fsS -o /dev/null http://127.0.0.1:${HOST_PORT}/ && echo "App is up" && exit 0
                                sleep 3
                            done
                            echo "App did not respond on port ${HOST_PORT}"; docker logs --tail 50 ${APP_NAME}; exit 1
                        '
                    """
                }
            }
        }

        stage('Cleanup old images') {
            steps {
                sshagent(credentials: [env.SSH_CREDENTIALS]) {
                    sh """
                        ssh -o StrictHostKeyChecking=accept-new ${DEPLOY_USER}@${DEPLOY_HOST} '
                            docker images ${APP_NAME} --format "{{.Tag}}" | grep -E "^[0-9]+\$" | sort -rn | tail -n +4 | \
                                xargs -r -I{} docker rmi ${APP_NAME}:{} || true
                        '
                    """
                }
                sh "docker image prune -f || true"
            }
        }
    }

    post {
        success {
            echo "Deployed ${APP_NAME}:${IMAGE_TAG} to https://ramp-tg.metaversedu.in"
        }
        failure {
            echo 'Deployment failed - check the stage logs above.'
        }
    }
}
