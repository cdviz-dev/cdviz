export class ArtifactInfo {
  readonly base: string;
  version: string;
  tags: Set<string>;

  constructor(artifactId: string) {
    const url = new URL(artifactId);
    const [base, version] = url.pathname.split("@");
    this.base = base;
    this.version = version ? decodeURIComponent(version) : version;
    this.tags = new Set(url.searchParams.getAll("tag"));
  }

  isSimilarTo(other: ArtifactInfo, debug?: boolean): boolean {
    let res = this.base === other.base;
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
      res = res && this.tags === other.tags && this.version === other.version;
      // if (debug) {
      //   console.debug(
      //     "check full",
      //     this.version,
      //     other.version,
      //     this.version === other.version,
      //     this.tags,
      //     other.tags,
      //     this.tags === other.tags,
      //     res,
      //   );
      // }
    }
    return res;
  }

  mergeVersionAndTags(other: ArtifactInfo): void {
    this.version = this.version || other.version;
    this.tags = this.tags.union(other.tags);
  }
}
