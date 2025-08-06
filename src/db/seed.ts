import SeedService from "@/modules/core/services/SeedService";

async function seed() {
  await SeedService.seed();
}

seed();
