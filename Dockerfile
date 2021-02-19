FROM node:14-stretch-slim

ENV APP_DIR=/srv-resolver
USER root
WORKDIR $APP_DIR/

# Copy bundle and scripts to the image APP_DIR
ADD ./dist $APP_DIR

CMD ["node","main.js"]
