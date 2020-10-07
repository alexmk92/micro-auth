import { Project } from "../entities/Project";
import { Resolver, Query, Ctx } from "type-graphql";
import { PsContext } from "src/types";

@Resolver()
export class ProjectResolver {
    @Query(() => [Project])
    projects(
        @Ctx() { em }: PsContext
    ): Promise<Project[]> {
        return em.find(Project, {})
    }
}
