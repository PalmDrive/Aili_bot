(function() {
  'use strict';

  var MessageFactory = function(Auth, LocalStorage) {
    class Message {
      constructor(values) {
        if (typeof values.id === 'undefined' || values.id === null) {
          values.id = ''
        };

        this._properties = Object.keys(values);

        for (let key in values) {
          this[key] = values[key];
        }

        return this;
      }

      toJSON() {
        const json = {};
        this._properties.forEach(key => {
          json[key] = this[key];
        });
        return json;
      }

      static init() {
        const currentUser = Auth.getCurrentUser();
        const json = {
          id: null,
          attributes: {
            type: 'text',
            content: '',
            senderId: currentUser.id,
            receiverId: 'aili_bot'
          },
          relationships: {
            user: {
              data: {
                id: currentUser.id,
                attributes: {
                  username: currentUser.get('username'),
                  headimgurl: currentUser.get('headimgurl')
                }
              }
            }
          }
        };
        return new Message(json);
      }
    }

    return Message;
  };

  const MessagesCollectionFactory = (Message, $http, $rootScope, API_ENDPOINT, $websocket, Auth, $timeout) => {
    class MessagesCollection {
      constructor() {
        const dataURL = `ws${API_ENDPOINT.url.replace('http', '')}/messages`;
         // const dataURL = `ws${API_ENDPOINT.url.replace('http', '')}/${Auth.getCurrentUser().get('objectId')}/messages`;

        console.log(`dataURL: ${dataURL}`);

        this._dataStream = $websocket(dataURL);
        this.data = [];
        this.allFetched = false;

        this._init();

        return this;
      }

      _init() {
        this._dataStream.onMessage(message => {
          console.log('new message came in!');
          console.log(message);

          const data = JSON.parse(message.data);
          let data1 = JSON.parse(message.data);
          data1.data.attributes.content = '';
          data1.data.inputingImage = true;

          switch (data.action) {
            case 'get':
              break;
            default:
              this.data.push(new Message(data1.data));
              $rootScope.$broadcast('scMessage:add');

              $timeout(() => {
                this.data.pop();
                this.data.push(new Message(data.data));
                $rootScope.$broadcast('scMessage:add');
                $rootScope.$broadcast('scMessage:addAfter');
              }, 2000);
              break;
          }
        });
      }

      fetch(options) {
        const defaultOptions = {
                limit: 20,
                orderBy: 'createdAt'
              },
              url = `${API_ENDPOINT.url}/messages`;
              // url = `${API_ENDPOINT.url}/${Auth.getCurrentUser().get('objectId')}/messages`;

        _.extend(defaultOptions, options);

        return $http.get(url, {params: defaultOptions})
          .then(res => {
            if (res.data) {
              this.data = res.data.data.map(d => new Message(d))
                .concat(this.data);

              if (res.data.data.length < defaultOptions.limit) {
                this.allFetched = true;
              }
            }

            return this.data;
          });
      }

      save(msg) {
        if (!Auth.isLogin()) {
          alert('没有登陆');
          throw new Error('没用登陆');
        }

        const currentUser = Auth.getCurrentUser();

        // TODO:
        // Need to update the msg id later
        this.data.push(msg);

        return this._dataStream.send({
          action: 'post',
          data: msg.toJSON(),
          token: currentUser.get('token')
        });
      }
    }

    return MessagesCollection;
  };

  angular.module('AiliBot').factory('Message', MessageFactory);
  //angular.module('AiliBot').factory('Messages', MessagesFactory);
  angular.module('AiliBot').factory('MessagesCollection', MessagesCollectionFactory);
})();
