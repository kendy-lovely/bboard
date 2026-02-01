export type User = {
    userID: string;
    username: string;
    email: string;
    createdAt: string;
    admin: boolean;
    bio: string;
    pfp: string;
    upvoted: number[];
    downvoted: number[];
    karma: number;
};

export type Post = {
    id: number;
    author: string;
    text: string;
    readMore: string;
    createdAt: string;
    parent: number;
    children: Post[];
    pfp: string;
    img: string;
    votes: number;
    voted: boolean[];
}