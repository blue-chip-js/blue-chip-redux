export default {
  "1": {
    attributes: {
      clientId: 2,
      createdAt: "2015-06-14T22:12:05.275Z",
      currencyId: 1,
      endDate: "2015-06-14T22:12:05.275Z",
      entityId: 1,
      freightVendorId: 2,
      fundingDue: "Monthly",
      fundingType: "Cashflow",
      isStarred: null,
      name: "Project 1",
      nickname: "nickname-1",
      officeId: 1,
      propertyId: 1,
      scopeConsulting: false,
      scopeFfe: false,
      scopeModelRoom: false,
      scopeOse: false,
      startDate: "2015-06-14T22:12:05.275Z",
      status: "Proposed",
      teamId: 1,
      type: "Full Renovation",
      updatedAt: "2015-06-14T22:12:05.275Z"
    },
    id: "1",
    relationships: {
      freightVendor: {
        data: {
          id: "2",
          type: "vendors"
        }
      },
      specs: {
        data: [
          {
            id: "1",
            type: "specs"
          },
          {
            id: "2",
            type: "specs"
          }
        ]
      }
    },
    type: "projects"
  }
};
