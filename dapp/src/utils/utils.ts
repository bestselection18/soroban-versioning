import { TransactionBuilder } from "@stellar/stellar-sdk";
import type {
  Proposal,
  ProposalStatus,
  ProposalView,
  ProposalViewStatus,
} from "types/proposal";
import type { Proposal as ContractProposal, Project } from "soroban_versioning";

export function truncateMiddle(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  const ellipsis = "...";
  const charsToShow = maxLength - ellipsis.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return (
    str.substring(0, frontChars) +
    ellipsis +
    str.substring(str.length - backChars)
  );
}

export function extractConfigData(tomlData: any, project: Project) {
  return {
    projectName: project.name,
    logoImageLink: tomlData.DOCUMENTATION?.ORG_LOGO || "",
    thumbnailImageLink: tomlData.DOCUMENTATION?.ORG_THUMBNAIL || "",
    description: tomlData.DOCUMENTATION?.ORG_DESCRIPTION || "",
    organizationName: tomlData.DOCUMENTATION?.ORG_NAME || "",
    officials: {
      websiteLink: tomlData.DOCUMENTATION?.ORG_URL || "",
      githubLink: project.config.url || "",
    },
    socialLinks: {
      ...(tomlData.DOCUMENTATION?.ORG_TWITTER && {
        twitter: tomlData.DOCUMENTATION.ORG_TWITTER,
      }),
      ...(tomlData.DOCUMENTATION?.ORG_TELEGRAM && {
        telegram: tomlData.DOCUMENTATION.ORG_TELEGRAM,
      }),
      ...(tomlData.DOCUMENTATION?.ORG_DISCORD && {
        discord: tomlData.DOCUMENTATION.ORG_DISCORD,
      }),
    },
    authorGithubNames:
      tomlData.PRINCIPALS?.map((p: { github: string }) => p.github) || [],
    maintainersAddresses: tomlData.ACCOUNTS || [],
  };
}

export function capitalizeFirstLetter(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export const processDecodedData = (xdrData: string): any => {
  let trxFromXdr;
  try {
    trxFromXdr = TransactionBuilder.fromXDR(
      xdrData,
      import.meta.env.PUBLIC_SOROBAN_NETWORK_PASSPHRASE,
    );
  } catch (error) {
    console.error("Error decoding XDR:", error);
  }

  return trxFromXdr;
};

export const modifySlashInXdr = (xdr: string) => {
  return xdr.replaceAll("/", "//");
};

export const getIpfsBasicLink = (ipfsLink: string) => {
  return `https://${ipfsLink}.ipfs.w3s.link/`;
};

export const getProposalLinkFromIpfs = (ipfsLink: string) => {
  return `https://${ipfsLink}.ipfs.w3s.link/proposal.md`;
};

export const getOutcomeLinkFromIpfs = (ipfsLink: string) => {
  return `https://${ipfsLink}.ipfs.w3s.link/outcomes.json`;
};

export const modifyProposalStatusToView = (
  status: ProposalStatus,
  endDate: number,
): ProposalViewStatus => {
  if (status === "approved") {
    return "approved";
  }
  if (status === "active") {
    if (endDate !== null) {
      const endDateTimestamp = new Date(endDate * 1000);
      const currentTime = new Date();

      if (endDateTimestamp < currentTime) {
        return "voted";
      }
      return "active";
    }
  }
  return status;
};

export const modifyProposalToView = (
  proposal: Proposal,
  projectName: string,
): ProposalView => {
  const proposalStatusView = modifyProposalStatusToView(
    proposal.status,
    proposal.voting_ends_at,
  );
  const proposalView: ProposalView = {
    id: proposal.id,
    title: proposal.title,
    projectName: projectName,
    ipfsLink: proposal.ipfs,
    endDate: proposal.voting_ends_at,
    nqg: proposal.nqg,
    voteStatus: proposal.voteStatus,
    status: proposalStatusView as ProposalViewStatus,
  };

  return proposalView;
};

export const modifyProposalFromContract = (
  proposal: ContractProposal,
): Proposal => {
  return {
    id: proposal.id,
    title: proposal.title,
    ipfs: proposal.ipfs,
    nqg: proposal.nqg,
    status: proposal.status.tag.toLocaleLowerCase() as ProposalStatus,
    voting_ends_at: Number(proposal.voting_ends_at),
    voteStatus: {
      approve: {
        voteType: "approve",
        score: proposal.voters_approve.length,
        voters: proposal.voters_approve.map((voter: string) => {
          return {
            address: voter,
            image: null,
            name: "",
            github: "",
          };
        }),
      },
      reject: {
        voteType: "reject",
        score: proposal.voters_reject.length,
        voters: proposal.voters_reject.map((voter: string) => {
          return {
            address: voter,
            image: null,
            name: "",
            github: "",
          };
        }),
      },
      abstain: {
        voteType: "abstain",
        score: proposal.voters_abstain.length,
        voters: proposal.voters_abstain.map((voter: string) => {
          return {
            address: voter,
            image: null,
            name: "",
            github: "",
          };
        }),
      },
    },
  };
};
