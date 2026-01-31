export type User = {
    userID: string;
    username: string;
    email: string;
    createdAt: string;
    admin: boolean;
    bio: string;
    pfp: string;
};

export type Post = {
    id: number;
    author: string;
    text: string;
    readMore: string;
    createdAt: string;
    parent: number;
    children: Post[];
    expanded: boolean;
    replying: boolean;
    pfp: string;
    img: string;
}