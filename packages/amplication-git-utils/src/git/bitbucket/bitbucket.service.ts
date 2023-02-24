import {
  Branch,
  CreateBranchIfNotExistsArgs,
  CreateCommitArgs,
  CreatePullRequestForBranchArgs,
  CreatePullRequestFromFilesArgs,
  CreateRepositoryArgs,
  GetAuthByTemporaryCodeResponse,
  GetCurrentUserResponse,
  GetFileArgs,
  GetPullRequestForBranchArgs,
  GetRepositoriesArgs,
  GetRepositoryArgs,
  GitFile,
  GitProvider,
  GitProviderArgs,
  RemoteGitOrganization,
  RemoteGitRepos,
  RemoteGitRepository,
} from "../../types";
import { CustomError, NotImplementedError } from "../../utils/custom-error";
import {
  authDataRequest,
  authorizeRequest,
  currentUserRequest,
} from "./requests";

export class BitBucketService implements GitProvider {
  private clientId: string;
  private clientSecret: string;
  private callbackUrl: string;
  private accessToken: string;
  private refreshToken: string;
  private expiresIn: number;

  constructor(private readonly gitProviderArgs: GitProviderArgs) {
    // TODO: move env variables to the server config
    const { BITBUCKET_CLIENT_ID, BITBUCKET_CLIENT_SECRET, CALLBACK_URL } =
      process.env;

    if (!BITBUCKET_CLIENT_ID || !BITBUCKET_CLIENT_SECRET || !CALLBACK_URL) {
      throw new Error("Missing BitBucket env variables");
    }

    this.clientId = BITBUCKET_CLIENT_ID;
    this.clientSecret = BITBUCKET_CLIENT_SECRET;
    this.callbackUrl = CALLBACK_URL;

    console.log("clientId", this.clientId);
    console.log("clientSecret", this.clientSecret);
    console.log("callbackUrl", this.callbackUrl);
  }

  async init(): Promise<void> {
    console.log("init");
  }

  async getCallbackUrl(): Promise<string> {
    return authorizeRequest(this.clientId);
  }

  // TODO: rename to getAccessToken and code to authorizationCode
  async getAccessToken(
    authorizationCode: string
  ): Promise<GetAuthByTemporaryCodeResponse> {
    try {
      const response = await authDataRequest(
        this.clientId,
        this.clientSecret,
        authorizationCode
      );

      const authData = await response.json();
      const {
        access_token,
        refreshToken,
        scopes,
        token_type,
        expires_in,
        state,
      } = authData;

      this.accessToken = access_token;
      this.refreshToken = refreshToken;
      this.expiresIn = expires_in;
      console.log({ authData });
      const scopesArr = scopes.split(" ");
      return {
        accessToken: access_token,
        refreshToken,
        scopes: scopesArr,
        tokenType: token_type,
        expiresIn: expires_in,
        state,
      };
    } catch (error) {
      // TODO: figure out how the error is look like
      const { message, code, status, cause } = error;
      throw new CustomError(message, { code, status, cause });
    }
  }

  async getCurrentUser(): Promise<GetCurrentUserResponse> {
    const { accessToken, refreshToken, clientId, clientSecret, expiresIn } =
      this;
    const response = await currentUserRequest({
      clientId,
      clientSecret,
      accessToken,
      refreshToken,
      expiresIn,
    });
    const currentUser = await response.json();
    console.log({ currentUser });
    const { links, created_on, display_name, username, uuid } = currentUser;
    return {
      links,
      createdOn: created_on,
      displayName: display_name,
      username,
      uuid,
    };
  }

  getGitInstallationUrl(amplicationWorkspaceId: string): Promise<string> {
    throw NotImplementedError;
  }

  getRepository(
    getRepositoryArgs: GetRepositoryArgs
  ): Promise<RemoteGitRepository> {
    throw NotImplementedError;
  }

  getRepositories(
    getRepositoriesArgs: GetRepositoriesArgs
  ): Promise<RemoteGitRepos> {
    throw NotImplementedError;
  }

  createRepository(
    createRepositoryArgs: CreateRepositoryArgs
  ): Promise<RemoteGitRepository> {
    throw NotImplementedError;
  }

  deleteGitOrganization(): Promise<boolean> {
    throw NotImplementedError;
  }

  getOrganization(): Promise<RemoteGitOrganization> {
    throw NotImplementedError;
  }

  getFile(file: GetFileArgs): Promise<GitFile> {
    throw NotImplementedError;
  }

  createPullRequestFromFiles(
    createPullRequestFromFilesArgs: CreatePullRequestFromFilesArgs
  ): Promise<string> {
    throw NotImplementedError;
  }

  createBranchIfNotExists(
    createBranchIfNotExistsArgs: CreateBranchIfNotExistsArgs
  ): Promise<Branch> {
    throw NotImplementedError;
  }

  createCommit(createCommitArgs: CreateCommitArgs): Promise<void> {
    throw NotImplementedError;
  }

  getPullRequestForBranch(
    getPullRequestForBranchArgs: GetPullRequestForBranchArgs
  ): Promise<{ url: string; number: number }> {
    throw NotImplementedError;
  }

  createPullRequestForBranch(
    createPullRequestForBranchArgs: CreatePullRequestForBranchArgs
  ): Promise<string> {
    throw NotImplementedError;
  }
}
