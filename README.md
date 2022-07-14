# spring_boot_chatapp
[메타코딩] 스프링부트와 몽고DB로 채팅서버 만들기

<br>

## 1. 환경설정
### 채팅서버 구현
- front : 자바스크립트, html, css

- back : 몽고DB, 스프링부트 5.0 (리액티브 WEB)

- 싱글스레드, 비동기 서버

<br>

## 2. MongoDB란?
### 2-1. RDBMS 와의 비교

#### User (table)
|ID|username|phone|
|------|---|---|
|1|ssar|010-2222-3333|
|2|cos|010-3333-4444|

<br>

#### Board (table)
|ID|title|content|username|phone|
|------|---|---|---|---|
|1|제목1|내용1|ssar|010-2222-3333|
|2|제목2|내용2|cos|010-3333-4444|

<br>

User 테이블과 Board 테이블을 살펴보면, `username` 과 `phone` 레코드가 중복되는 것을 볼 수 있다.  
따라서 RDBMS 에서는 중복을 피하기 위해 다음과 같이 User와 Board 테이블을 조인해서 생성한다.

#### Board (RDBMS)
|ID|title|content|userId|
|------|---|---|---|
|1|제목1|내용1|1|
|2|제목2|내용2|2|

<br>

Board 테이블의 `userId=1` 의 내용을 select 한다고 하면 user table 에서
ID가 1인 row를 참조해서 가져오게 되는 것이다.

<br>

### RDBMS의 장점
1. 중복을 허용하지 않는다.
2. `username` 을 ssar에서 kim으로 변경한다고 했을 때, user table의 값만 변경하면 된다.

<br>

### RDBMS의 단점
1. 위에서 언급한대로 Board table에서 ID가 1인 row를 조회한다고 하면     
user table도 조인해서 모두 같이 가져오는 방식이므로 퍼포먼스(성능)가 떨어진다.
2. 테이블 간의 관계를 맺고 있어 시스템이 커지면 복잡한 쿼리가 만들어질 수 있다.

<br>

### 2-2. MongoDB (NoSQL)
특징  
- 컬렉션으로 이루어져 있음. (List와 비슷)
- RDBMS와 달리 테이블 간의 관계를 정의하지 않음.
- 테이블은 그냥 하나의 테이블이며 테이블 간 join도 불가능.

<br>

ex. 
```json

user : [
        {
         "id":"1", 
         "username":"ssar",
         "phone":"010-2222-3333"
        },
        {
         "id":"2", 
         "username":"cos", 
         "phone":"010-3333-4444"
         }
        ]

board : [
          {
           "id":"1",
           "title":"제목1",
           "content":"내용1",
           "username":"ssar",
           "phone":"010-2222-3333"
          }
        ]
```

<br>

### MongoDB의 장점
1. 중복을 허용하기 때문에 데이터를 찾을 때 성능이 좋다.   
(table을 조인할 필요없이 한번에 가져올 수 있음 => json 객체안에 다 담겨있음)
2. 사용법이 간단하고 편리하다.

<br>

### MongoDB의 단점
1. 데이터의 일관성을 유지하기 힘들다. 
(ex. `username` 을 ssar -> kim으로 변경할 시, 다른 컬렉션에서도 변경해주어야 함.)
2. 메모리 사용량이 크다. 


<br>

## 3. 스프링 5.0
- Netty 서버가 탑재되어 있음  
- MongoDB 연결 가능

### 3-1. 서블릿 기반 스프링의 동작 방식
: 사용자의 `request(요청)` 가 있을 때마다 스레드가 만들어짐.

<br>

but, `스프링 5.0` 은 비동기 서버  
따라서 스레드가 오직 한 개만 만들어짐.   
그렇다면 어떻게 동작하는가?

### 3-2. 동기식 서버 

![image](https://user-images.githubusercontent.com/87354210/178677074-f77cda78-8bec-464b-a62e-743875993cd3.png)
- 클라이언트의 요청이 올 때마다 스레드가 생성됨.
- 컨텍스트 스위칭 비용이 발생. (서버가 요청 처리를 위해 왔다갔다하면서 발생하는 비용)
- 들어온 순서대로 응답을 처리하기 때문에 시간이 더 오래 걸림. 

<br>

### 3-3. 비동기식 서버

![image](https://user-images.githubusercontent.com/87354210/178677324-bd4fce58-c458-45bf-8907-49ff0f9a8022.png)

- 스레드는 하나로만 작동
- 컨텍스트 스위칭 비용이 발생하지 않음.
- 응답이 오래걸리면 대기열에 두고 그 시간 동안 다른 작업을 먼저 할 수 있음. (시간을 단축시킬 수 있음)

<br>

### 3-4. 비동기식 DB
- 대표적으로 MongoDB
- RDBMS는 동기식.

<br>

but, `R2DBC` 라이브러리를 사용하면 MySQL, MariaDB와 같은 RDBMS도 비동기로 사용 가능.

<br>

## 4. @Tailable

`ChatController`
```java
package com.cos.chatapp;
import org.springframework.data.mongodb.repository.ReactiveMongoRepository;
import reactor.core.publisher.Flux;

public interface ChatRepository extends ReactiveMongoRepository<Chat, String> {
        
        @Tailable // 커서를 안닫고 계속 유지한다.
        @Query("{sender:?0, receiver:?1}")
        Flux<Chat> mFindBySender(String sender, String receiver); // Flux (흐름)
}
```

<br>

`WebFlux`
- spring Framework 5 에서 추가된 모듈.
- clent, server에서 reactive 스타일의 어플리케이션 개발을 도와줌.
- 요청과 응답이 완료된 후에도 response를 유지하면서 데이터를 계속 흘려보낼 수 있음.

<br>

`Tailable`

![image](https://user-images.githubusercontent.com/87354210/178924059-ce7bb1fb-bdd8-4b89-8795-0239f1e60e02.png)

<br>

> 애노테이션 @Tailable을 붙이게 되면 다음과 같이 작동한다.  

1. mongoDB에 `sender : ssar`, `msg : 안녕` 이라는 데이터가 들어있다고 했을 때, 클라이언트로부터 쿼리 요청을 받음  

2. Controller가 DB로부터 요청을 전달 받고 클라이언트에게 응답을 해줌    

3. client는 받은 응답을 화면에 렌더링 ( `"sender : ssar", "msg : 안녕"` )  

4. 또 다른 client가 데이터 한 건을 mongoDB에 save 요청 ( `"sender : ssar", "msg : 반가워"` )  

5. Tailable로 커서를 열어둔 상태이므로 새로운 데이터가 들어왔을 때, 응답을 그대로 컨트롤러에 전달  

6. Controller는 Flux로 계속해서 응답을 client로 흘려보냄 

<br>

## 5. Socket 방식

<br>

`Socket 방식`

![image](https://user-images.githubusercontent.com/87354210/178933227-dda69dc4-c025-4421-b453-2101d2809c84.png)

<br>

- 서버와 클라이언트 양방향 연결이 이루어지는 통신
- Connection이 끊어지지 않고 있기 때문에 언제든 데이터를 주고 받을 수 있음.

<br>

## 6. HTTP 프로토콜 vs SSE

![image](https://user-images.githubusercontent.com/87354210/178928325-f0a1f109-febe-493a-adf5-cec561b3e265.png)

<br>

`HTTP`
- 클라이언트의 요청이 있을 때 서버가 응답하는 단방향 통신
- 서버가 클라이언트의 요청을 모두 받았다가 한번에 응답
- 이 후, 연결을 종료 시킴

<br>

`SSE`
- 서버의 데이터를 실시간으로 지속적으로 스트리밍 하는 기술.
- 요청과 응답이 이루어지면 `요청(request)` 은 끊어지나 `응답(response)` 은 유지하고 있다가 다음 데이터가  
Tailable을 통해 들어오면 서버는 flux로 데이터를 계속 받을 수 있음.  

<br>



