# DDL commands to create Stack Overflow schemas

## post history

```sql
CREATE TABLE posthistory (
    id integer NOT NULL PRIMARY KEY,
    posthistorytypeid integer,
    postid integer REFERENCES posts(id),
    revisionguid text,
    creationdate timestamp without time zone,
    userid integer REFERENCES users(id),
    text text,
    contentlicense text,
    comment text,
    userdisplayname text
);

CREATE INDEX idx_posthistory_postid ON posthistory USING btree (postid);
```

## posts

```sql
CREATE TABLE posts (
    id integer NOT NULL PRIMARY KEY,
    posttypeid integer,
    acceptedanswerid text,
    creationdate timestamp without time zone,
    score integer,
    viewcount integer,
    body text,
    owneruserid integer REFERENCES users(id),
    ownerdisplayname text,
    lasteditoruserid text,
    lasteditordisplayname text,
    lasteditdate timestamp without time zone,
    lastactivitydate timestamp without time zone,
    title text,
    tags text,
    answercount integer,
    commentcount integer,
    favoritecount integer,
    conentlicense text,
    parentid text,
    communityowneddate timestamp without time zone,
    closeddate timestamp without time zone
);

CREATE INDEX idx_posts_owneruserid ON posts USING btree (owneruserid);
```

## users

```sql
CREATE TABLE users (
    id integer NOT NULL PRIMARY KEY,
    reputation integer,
    creationdate timestamp without time zone,
    displayname text,
    lastaccessdate timestamp without time zone,
    aboutme text,
    views integer,
    upvotes integer,
    downvotes integer,
    websiteurl text,
    location text,
    accountid text
);

CREATE INDEX idx_users_account_id ON users USING btree (accountid);
```

## comments

```sql
CREATE TABLE comments (
    id integer NOT NULL PRIMARY KEY,
    postid integer REFERENCES posts(id),
    score integer,
    text text,
    creationdate timestamp without time zone,
    userid integer REFERENCES users(id),
    userdisplayname text
);

CREATE INDEX idx_comments_postid ON votes (PostId);
CREATE INDEX idx_comments_userid ON votes (UserId);
```

## votes

```sql
CREATE TABLE votes (
    id integer NOT NULL,
    postid integer REFERENCES posts(id),
    votetypeid integer,
    creationdate timestamp without time zone NOT NULL,
    userid integer,
    bountamount text,
    PRIMARY KEY (id, creationdate)
) PARTITION BY RANGE (CreationDate);

CREATE INDEX idx_votes_postid ON votes (PostId);

CREATE TABLE votes_202401 PARTITION OF votes FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
CREATE TABLE votes_202402 PARTITION OF votes FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
CREATE TABLE votes_202403 PARTITION OF votes FOR VALUES FROM ('2024-03-01') TO ('2024-04-01');
CREATE TABLE votes_2000_2024 PARTITION OF votes FOR VALUES FROM ('2000-01-01') TO ('2024-01-01');
```

## badges

```sql
CREATE TABLE badges (
    id integer NOT NULL PRIMARY KEY,
    userid integer REFERENCES users(id),
    name text,
    date timestamp without time zone,
    class integer,
    tagbased boolean
);
```

## post links

```sql
CREATE TABLE postlinks (
    id integer NOT NULL PRIMARY KEY,
    creationdate timestamp without time zone,
    postid integer REFERENCES posts(id),
    relatedpostid integer REFERENCES posts(id),
    linktypeid integer
);
```
