
import logging
from sqlmodel import SQLModel, Session, select, text
import sys
import os

# Add backend directory to sys.path to allow imports
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from database import engine
from models import CategoryTemplateLink, PromptTemplate, Category

# Configure Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def migrate_onboarding_links():
    """
    1. Create CategoryTemplateLink table if not exists.
    2. Copy existing PromptTemplate.category_id relationships to CategoryTemplateLink.
       This ensures current onboarding flow continues to work seamlessly.
    """
    logger.info("Starting Onboarding Links Migration...")
    
    # 1. Create Table
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Ensured CategoryTemplateLink table exists.")
    except Exception as e:
        logger.error(f"Error creating table: {e}")
        return

    # 2. Migrate Data
    with Session(engine) as session:
        # Get all templates that have a category assigned
        templates = session.exec(
            select(PromptTemplate).where(PromptTemplate.category_id != None)
        ).all()
        
        logger.info(f"Found {len(templates)} templates with assigned categories.")
        
        migrated_count = 0
        skipped_count = 0
        
        for template in templates:
            # Check if link already exists
            existing_link = session.exec(
                select(CategoryTemplateLink)
                .where(
                    CategoryTemplateLink.category_id == template.category_id,
                    CategoryTemplateLink.template_id == template.id
                )
            ).first()
            
            if not existing_link:
                new_link = CategoryTemplateLink(
                    category_id=template.category_id,
                    template_id=template.id
                )
                session.add(new_link)
                migrated_count += 1
            else:
                skipped_count += 1
        
        try:
            session.commit()
            logger.info(f"Migration Complete. New Links: {migrated_count}, Skipped: {skipped_count}")
        except Exception as e:
            session.rollback()
            logger.error(f"Failed to commit migration: {e}")

if __name__ == "__main__":
    migrate_onboarding_links()
