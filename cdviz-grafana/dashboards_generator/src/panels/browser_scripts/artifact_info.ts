export class ArtifactInfo {
  readonly base: string;
  readonly repositoryUrl: string | null;
  version: string;
  tags: Set<string>;

  constructor(artifactId: string) {
    const url = new URL(artifactId);
    const [base, version] = url.pathname.split("@");
    this.base = base;
    this.version = version ? decodeURIComponent(version) : version;
    this.tags = new Set(url.searchParams.getAll("tag"));
    this.repositoryUrl = url.searchParams.get("repository_url");
  }

  isSimilarTo(other: ArtifactInfo, _debug?: boolean): boolean {
    let res =
      this.base === other.base && this.repositoryUrl === other.repositoryUrl;
    // if (debug) {
    //   console.debug(this.base, other.base, this.base === other.base, res);
    // }
    if (!!this.version && !!other.version) {
      res = res && this.version === other.version;
      // if (debug) {
      //   console.debug(
      //     "check version",
      //     this.version,
      //     other.version,
      //     this.version === other.version,
      //     res,
      //   );
      // }
    } else if (this.tags.size > 0 && other.tags.size > 0) {
      const intersection = this.tags.intersection(other.tags);
      intersection.delete("latest");
      res = res && intersection.size > 0;
      // if (debug) {
      //   console.debug("check tags", this.tags, other.tags, intersection, res);
      // }
    } else {
      // Only merge when BOTH sides have no version AND no non-latest tags.
      // Prevents bare/CI artifacts (no tags, no version) from merging with
      // tag-versioned artifacts (e.g. pkg:app?tag=0.1.0), which would create
      // spurious lifecycle edges in the timeline.
      const nonLatestSelf = new Set(this.tags);
      nonLatestSelf.delete("latest");
      const nonLatestOther = new Set(other.tags);
      nonLatestOther.delete("latest");
      res =
        res &&
        this.version === other.version &&
        nonLatestSelf.size === 0 &&
        nonLatestOther.size === 0;
    }
    return res;
  }

  get hasVersion(): boolean {
    const nonLatestTags = new Set(this.tags);
    nonLatestTags.delete("latest");
    return !!this.version || nonLatestTags.size > 0;
  }

  mergeVersionAndTags(other: ArtifactInfo): void {
    this.version = this.version || other.version;
    this.tags = this.tags.union(other.tags);
  }
}
