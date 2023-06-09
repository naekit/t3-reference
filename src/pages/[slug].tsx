import type { GetStaticProps, NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";

import { PageLayout } from "~/components/layout";
import Image from "next/image";
import { LoadingPage } from "~/components/loading";
import PostView from "~/components/postview";
import { generateSsgHelper } from "~/server/helpers/ssgHelper";

const ProfileFeed = (props: { userId: string }) => {
  const { data, isLoading } = api.posts.getPostByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted!</div>;

  return (
    <>
      {data.map((post) => (
        <PostView key={post.post.id} post={post.post} author={post.author} />
      ))}
    </>
  );
};

const ProfilePage: NextPage<{ username: string }> = ({ username }) => {
  const { data } = api.profile.getUserByUserName.useQuery({
    username,
  });

  if (!data) return <div>404 Not found</div>;

  return (
    <>
      <Head>
        <title>{data.name}</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <PageLayout>
        <div>
          <div className="relative h-36 bg-slate-600">
            <Image
              src={data.profileImageUrl}
              width={128}
              height={128}
              alt={`${data.name ?? ""} profile picture`}
              className="absolute bottom-0 left-0 -mb-[64px] ml-4 rounded-full border-4 border-gray-800 bg-gray-800"
              priority
            />
          </div>
          <div className="h-[64px]"></div>
          <div className="p-4">
            <h1 className="text-2xl font-bold">{`@${data.name ?? ""}`}</h1>
          </div>
          <div className="w-full border-b border-slate-400"></div>
          <ProfileFeed userId={data.id} />
        </div>
      </PageLayout>
    </>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSsgHelper();

  const slug = context.params?.slug;

  if (typeof slug !== "string") throw new Error("No slug string");

  const username = slug.replace("@", "");

  await ssg.profile.getUserByUserName.prefetch({ username });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      username,
    },
  };
};

export const getStaticPaths = () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default ProfilePage;
