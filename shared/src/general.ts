export interface VersionResponse {
    version: string;
    commit: string;
    name: string;
}

//TODO: this isn't stable and can be extended, but since this are strings, it is easy in most implementation, that rely on this
export type APIFeature = 'achievements' | 'multiplayer' | 'recordings';

export type APIFeatures = APIFeature[];
